import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";

const typeDefs = gql(readFileSync("./schema.graphql", "utf8"));

// --- Mock Data ---
const authors = [
  { id: "1", name: "George Orwell" },
  { id: "2", name: "J.K. Rowling" },
];

const books = [
  { id: "101", title: "1984", authorId: "1" },
  { id: "102", title: "Animal Farm", authorId: "1" },
  { id: "201", title: "Harry Potter and the Sorcerer's Stone", authorId: "2" },
];

// --- Resolvers ---
const resolvers = {
  Query: {
    hello: () => "Hello from the subgraph!",
    books: () => books,
    bookById: (_, { id }) => books.find((b) => b.id === id),
    authors: () => authors,
    authorById: (_, { id }) => authors.find((a) => a.id === id),
  },

  Book: {
    author: (book) => authors.find((a) => a.id === book.authorId),
  },

  Author: {
    books: (author) => books.filter((b) => b.authorId === author.id),
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers,
  }),
});

// Start Apollo Server
// Note the top-level await!
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  listen: { port: 4001 },
});

console.log(`Subgraph running at ${url}`);
