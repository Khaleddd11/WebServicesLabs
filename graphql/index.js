const { ApolloServer, gql } = require("apollo-server");

const users = [
  { fullname: "Ali Hassan", email: "ali@example.com", dob: "2000-05-20" },
  { fullname: "Sara Nasser", email: "sara@example.com", dob: "1999-09-11" },
];

const comments = [
  { id: "c1", articleId: "1", title: "Great Read", content: "Very helpful article." },
  { id: "c2", articleId: "1", title: "Thanks", content: "Clear and simple explanation." },
  { id: "c3", articleId: "2", title: "Nice", content: "I liked this topic." },
];

const articles = [
  { id: "1", title: "GraphQL Basics", content: "Intro to GraphQL.", authorEmail: "ali@example.com" },
  { id: "2", title: "Node API", content: "Building APIs with Node.js.", authorEmail: "sara@example.com" },
];

const typeDefs = gql`
  type User {
    fullname: String!
    email: String!
    dob: String!
  }

  type Comment {
    title: String!
    content: String!
  }

  type Article {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type Query {
    articles: [Article!]!
    articleById(id: ID!): Article
  }

  type Mutation {
    createArticle(title: String!, content: String!, authorEmail: String!): Article!
  }
`;

const resolvers = {
  Query: {
    articles: () => articles,
    articleById: (_, { id }) => articles.find((article) => article.id === id) || null,
  },
  Mutation: {
    createArticle: (_, { title, content, authorEmail }) => {
      const author = users.find((user) => user.email === authorEmail);
      if (!author) {
        throw new Error("Author not found");
      }

      const nextId = String(Math.max(0, ...articles.map((article) => Number(article.id))) + 1);
      const newArticle = {
        id: nextId,
        title,
        content,
        authorEmail,
      };

      articles.push(newArticle);
      return newArticle;
    },
  },
  Article: {
    author: (article) => users.find((user) => user.email === article.authorEmail),
    comments: (article) =>
      comments
        .filter((comment) => comment.articleId === article.id)
        .map((comment) => ({ title: comment.title, content: comment.content })),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`GraphQL server ready at ${url}`);
})geaph