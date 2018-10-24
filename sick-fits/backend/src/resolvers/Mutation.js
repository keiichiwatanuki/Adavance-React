const Mutations = {
  async createItem(parent,args,ctx,info){
    //TODO check if they are loged in
    //the context is exported in createServer
    const item = await ctx.db.mutation.createItem({
      //title: args.title,
      //description: args.description, etc sooo
      data : {...args}
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
    const item = await ctx.db.query.item({where},`{id title}`);
    //2. check if they own that item or have the permissions
    //TO DO 
    //3. delete it
    return ctx.db.mutation.deleteItem({where},info);
  }
};

module.exports = Mutations;
