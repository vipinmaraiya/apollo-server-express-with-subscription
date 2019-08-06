const {
    ApolloServer,
    PubSub
} = require("apollo-server-express");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLSchema
} = require("graphql");
const http = require("http");

const express = require("express");
const app = express();

const pubsub = new PubSub();

const books = [
    {
      title: 'Harry Potter and the Chamber of Secrets',
      author: 'J.K. Rowling',
    },
    {
      title: 'Jurassic Park',
      author: 'Michael Crichton',
    },
  ];

  const BookType = new GraphQLObjectType({
    name:"BookType",
    fields:() =>({
      title:{
        type: GraphQLString
      },
      author:{
        type: GraphQLString
      }
    })
  })

  const Query = new GraphQLObjectType({
    name: "Query",
    fields:()=>({
      books:{
        type:new GraphQLList(BookType),
        resolve(){
          return books;
        }
      }
    })
  });

  const Subscriptions = new GraphQLObjectType({
    name:"Subscriptions",
    fields:() =>({
      addBook:{
        type: new GraphQLList(BookType),
        resolve(){
          return books;
        },
        subscribe(){
          return pubsub.asyncIterator("ADD_BOOK")
        }
      }
    })
  });

  const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: ()=>({
      addBook:{
        type: new GraphQLList(BookType),
        args:{
          title:{
            type: GraphQLString
          }
        },
        resolve(parent, args, context){
          console.log(context)
          books.push({
            title:args.title,
            author:"VIpin"
          })
          pubsub.publish("ADD_BOOK", books)
            return books;
        }
      }
    })
  })


  const schema = new GraphQLSchema({
    query: Query,
    subscription: Subscriptions,
    mutation: Mutation
  })

  // app.use("/graphql", (req, res, next) =>{
  //   next();
  // })

  const server = new ApolloServer({ schema, context: ({req})=>{

    return {useR:"vipin"}
  } });
const httpServer = http.createServer(app);

  server.installSubscriptionHandlers(httpServer);

  server.applyMiddleware({
    app,
    path:"/graphql"
  })

  httpServer.listen(4000, () =>{
  console.log("Server is running on port 4000")
})