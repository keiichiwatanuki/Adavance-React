const { forwardTo } = require('prisma-binding'); 
//when you don't need custom logic or authentication you 
//just fordward the queryes

const Query = {
 /*  async items(parent,args,ctx,info){
    const items = await ctx.db.query.items();
    return items;
  }  */
  items: forwardTo('db'), 
  item: forwardTo('db'),
};

module.exports = Query;
