const Mutations = {
  async createItem(parent,args,ctx,info){
    //TODO check if they are loged in
    //the context is exported in createServer
    const item = await ctx.db.mutation.createItem({
      //title: args.title,
      //description: args.description, etc sooo
      data : {...args}
    },info);
    
  console.log(item);
  return item;
}
};

module.exports = Mutations;
