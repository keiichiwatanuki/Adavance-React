const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");
//when you don't need custom logic or authentication you
//just fordward the queryes

const Query = {
  /*  async items(parent,args,ctx,info){
    const items = await ctx.db.query.items();
    return items;
  }  */
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //this is a shorhand for me : function()...etc
    //check if there is a current user id
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    ); //info is the query that's coming from the client
  },
  async users(parent, args, ctx, info) {
    console.log("1", ctx.request);
    //1. check if the user is logged in
    if (!ctx.request.userId) {
      throw Error("you have no power here");
    }
    //2. check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    //3. query all the users
    return ctx.db.query.users({}, info); //info contains the graphql query
  },
  async order(parent, args, ctx, info) {
    //1. make sure they are logged in
    if (!ctx.request.userId) {
      throw Error("you have to be logged in to see this");
    }
    //2. query the current order
    order = await ctx.db.query.order({ where: { id: args.id } }, info);
    //3. check if they have the permissions to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      "ADMIN"
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("you can't see this");
    }
    //4. return the order
    return order;
  },
  async orders(parent, args, ctx, info) {
    //1. make sure they are logged in
    if (!ctx.request.userId) {
      throw Error("you have to be logged in to see this");
    }
    //2. query the current order*/
    return ctx.db.query.orders(
      { where: { user: { id: ctx.request.userId } } },
      info
    );
  }
};

module.exports = Query;
