const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");

const stripe = require("../stripe");
const mercadopago = require("mercadopago");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    //check if they are loged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that");
    }
    //the context is exported in createServer
    const item = await ctx.db.mutation.createItem(
      {
        //title: args.title,
        //description: args.description, etc sooo
        data: {
          //this is how you create a relationship between the item and the user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that");
    }
    //first take a copy of the updates
    const updates = { ...args };
    //remove id from the updates, because it doesn't change
    delete updates.id;
    //run update method, because it's returning that promise, it's smart enough to know that it has to wait for it
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //1. find the item, i have to find it first, so i can then check the permissions
    //instead of info(meaning the query from the front), we are going to pass, a query directly
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    //2. check if they own that item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permissions =>
      ["ADMIN", "ITEMDELETE"].includes(permissions)
    );
    if (!ownsItem || !hasPermissions) {
      throw new Error("you dont have permission to delete this");
    }
    //3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    //hash the password
    const password = await bcrypt.hash(args.password, 10); //the number is the length of the salt
    //create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    //create the JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //we set the jwt cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    });
    //finally we return the user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    //1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`no such user with email ${email}`);
    }
    //2. check if their password is correct
    const valid = await bcrypt.compare(password, user.password); //it hashes the not hashed one hassssh
    if (!valid) {
      throw new Error("invalid Password!");
    }
    //3. generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //4. set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    });
    //5. return the user
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "success" };
  },
  async requestReset(parent, args, ctx, info) {
    //1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error("No user found with that email");
    }
    //2. Set a reset token and expiry for that user
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; //one hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    //3. Email them the reset token
    const mailRes = await transport.sendMail({
      from: "ed@me.com",
      to: user.email,
      subject: "password recovery",
      html: makeANiceEmail(`Your password reset token is here\n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
      Click Here to Reset your Password</a>`)
    });
    //4. Return a message
    return { message: "im a string" };
  },
  async resetPassword(parent, args, ctx, info) {
    //1. Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("passwords dont match");
    }
    //2. Check if it is a legit reset token
    //3. check if it is expired
    //because we can only search for an user based on unique inputs
    //we look for the first user in an array of users with that token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("wrong token");
    }
    //4. hash the new password
    const password = await bcrypt.hash(args.password, 10);
    //5. save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
        password
      }
    });
    //6. generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    //7. set the jwt cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    //8. return the new user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    //1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    //2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
    //3. check if they have permission to do this
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    //4. update the permissions
    return ctx.db.mutation.updateUser(
      {
        where: {
          id: args.userId
        },
        data: {
          permissions: {
            set: args.permissions
          }
        }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    //1. make sure they are signed in
    const userId = ctx.request.userId;
    if (!userId) {
      throw new Error("You're not logged in");
    }
    //2. query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    //3. check if the item is already in the cart
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    //4. if its not, create a new cart item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    //1. find the cart item
    cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{ id user { id } }`
    );
    //1.5 make sure we found an item
    if (!cartItem) {
      throw new Error("I didnt found that item");
    }
    //2. make sure they own that cart item
    //remember that to have the cartItem user id, i have to
    //query that information in the second argument of the cartItem query
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("this isnt your cart");
    }
    //3. Delete that cart Item
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: cartItem.id
        }
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    //1. query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw Error("You have to be logged in");
    }
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{ id name email 
        cart { id quantity 
          item { title price id description image largeImage }
        }
      }`
    );
    //2. recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log(`going to charge ${amount}`);
    //3. create the stripe charge turn token into $$$$
    const charge = await stripe.charges.create({
      amount,
      currency: "ARS",
      source: args.token
    });
    //4. Convert the cart Items to order Items
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });
    //5. create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    //6. clean the user's cart delete cart item's
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    //7. return the order to the client
    return order;
  },
  async createOrderMP(parent, args, ctx, info) {
    console.log("mutation");
    const { userId } = ctx.request;
    if (!userId) {
      throw Error("You have to be logged in");
    }
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{ id name email 
        cart { id quantity 
          item { title price id description image }
        }
      }`
    );

    const items = user.cart.map(cart => {
      item = {
        id: cart.id,
        title: cart.item.title,
        quantity: cart.quantity,
        currency_id: "ARS",
        unit_price: cart.item.price / 100
      };
      return item;
    });
    const preference = {
      items,
      payer: {
        email: user.email
      },
      back_urls: {
        success: "localhost:7777",
        pending: "",
        failure: "localhost:7777/fail"
      },
      notification_url:
        "https://webhook.site/8e737bb3-2d74-45de-af49-30432079cdb8"
    };
    //TODO guardar el id del pago en la db junto con la orden e implementar
    //el webhook para actualizar el estado del pago
    const { response } = await mercadopago.preferences.create(preference);
    console.log(response);
    return response.init_point;
  }
};

module.exports = Mutations;
