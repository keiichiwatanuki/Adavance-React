const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const {transport, makeANiceEmail} = require('../mail');
const { hasPermission } = require('../utils');


const Mutations = {
  async createItem(parent,args,ctx,info){
    //check if they are loged in
    if(!ctx.request.userId){
      throw new Error('You must be logged in to do that');
    }
    //the context is exported in createServer
    const item = await ctx.db.mutation.createItem({
      //title: args.title,
      //description: args.description, etc sooo
      data : {
        //this is how you create a relationship between the item and the user
        user:{
          connect:{
            id:ctx.request.userId,
          },
        },
        ...args
      }
    },info);
  return item;
},
  updateItem(parent,args,ctx,info){
    //first take a copy of the updates
    const updates = {...args};
    //remove id from the updates, because it doesn't change
    delete updates.id;
    //run update method, because it's returning that promise, it's smart enough to know that it has to wait for it
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {id: args.id },
    },info);
  },
  async deleteItem(parent,args,ctx,info){
    const where = {id: args.id};
    //1. find the item, i have to find it first, so i can then check the permissions
    //instead of info(meaning the query from the front), we are going to pass, a query directly
    const item = await ctx.db.query.item({where},`{id title user {id}}`);
    //2. check if they own that item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(
      permissions => ['ADMIN','ITEMDELETE'].includes(permissions)
    );
    if(!ownsItem||!hasPermissions){
      throw new Error('you dont have permission to delete this');
    }
    //3. delete it
    return ctx.db.mutation.deleteItem({where},info);
  },
  async signup(parent,args,ctx,info){
    args.email = args.email.toLowerCase();
    //hash the password
    const password = await bcrypt.hash(args.password,10); //the number is the length of the salt
    //create the user in the database
    const user = await ctx.db.mutation.createUser({
      data:{
        ...args,
        password,
        permissions: {set : ['USER']},
      },
    },info);
    //create the JWT
    const token = jwt.sign({userId: user.id},process.env.APP_SECRET);
    //we set the jwt cookie on the response
    ctx.response.cookie('token',token,{
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    });
    //finally we return the user to the browser
    return user;
  },

  async signin(parent,{email,password},ctx,info){
    //1. check if there is a user with that email
    const user = await ctx.db.query.user({where: { email }});
    if(!user){
      throw new Error(`no such user with email ${email}`);
    }
    //2. check if their password is correct
    const valid = await bcrypt.compare(password,user.password); //it hashes the not hashed one hassssh
    if(!valid){
      throw new Error ("invalid Password!");
    }
    //3. generate the jwt token
    const token = jwt.sign({userId: user.id},process.env.APP_SECRET);
    //4. set the cookie with the token
    ctx.response.cookie('token',token,{
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    });
    //5. return the user
    return user;
  },
  async signout(parent,args,ctx,info){
    ctx.response.clearCookie('token');
    return {message: "success"};
  },
  async requestReset(parent,args,ctx,info){
    //1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email }});
    if(!user){
      throw new Error('No user found with that email');
    }
    //2. Set a reset token and expiry for that user
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 1000*60*60; //one hour from now
    const res = await ctx.db.mutation.updateUser({
      where : { email: args.email},
      data: { resetToken , resetTokenExpiry}
    });
    //3. Email them the reset token
    const mailRes = await transport.sendMail({
      from:'ed@me.com',
      to:user.email,
      subject:'password recovery',
      html:makeANiceEmail(`Your password reset token is here\n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
      Click Here to Reset your Password</a>`),
    })
    //4. Return a message
    return { message: 'im a string' }
  },
  async resetPassword(parent,args,ctx,info){
   //1. Check if the passwords match
   if(args.password!==args.confirmPassword){
     throw new Error('passwords dont match');
   }
   //2. Check if it is a legit reset token
   //3. check if it is expired
   //because we can only search for an user based on unique inputs
   //we look for the first user in an array of users with that token
   const [user] = await ctx.db.query.users(
     {where: { 
       resetToken: args.resetToken,
       resetTokenExpiry_gte: Date.now() - 3600000,
      }}
     );
     if(!user){
       throw new Error('wrong token');
     }
   //4. hash the new password
   const password = await bcrypt.hash(args.password,10);
   //5. save the new password to the user and remove old reset token fields
   const updatedUser = await ctx.db.mutation.updateUser({
    where : { email: user.email},
    data: { 
      resetToken: null, 
      resetTokenExpiry: null,
      password
    }
  });
   //6. generate jwt
   const token = jwt.sign({userId: updatedUser.id},process.env.APP_SECRET);
   //7. set the jwt cookie
   ctx.response.cookie('token',token,{
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
   //8. return the new user
   return updatedUser;
  },
  async updatePermissions(parent,args,ctx,info){
    //1. Check if they are logged in
    if(!ctx.request.userId){
      throw new Error('You must be logged in');
    }
    //2. Query the current user
    const currentUser = await ctx.db.query.user({
      where:{
        id: ctx.request.userId,
      },
    },info);
    //3. check if they have permission to do this
    hasPermission(currentUser,["ADMIN","PERMISSIONUPDATE"]);
    //4. update the permissions
    return ctx.db.mutation.updateUser({
      where: {
        id: args.userId,
      },
      data: {
        permissions: {
          set : args.permissions,
        },
      },
    },info);
  }
};

module.exports = Mutations;
