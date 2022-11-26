const { v1: uuid } = require('uuid');
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose')
const Author = require('./schemas/AuthorSchema')
const Book = require('./schemas/BookSchema')
const User = require('./schemas/UserSchema')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URL = "mongodb+srv://jepsu:vgXZACM5aIkqX6pi@cluster0.hjkte.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book!
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
    addAuthor(
      name: String!
      born: Int
    ): Author!
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {return getAuthorBooks(args)},
    allAuthors:async (root) => {
      return Author.find({})
    },
    me: async (root, args, context) => {
      const user = await User.findOne({username: context.currentUser.username})
      console.log(user)
      return user
    }
  },
  Author: {
    bookCount: (root) => {
        return getCount(root.name)
    }
  },
  Mutation: {
    addBook: async (root, args, {currentUser}) => {
        let author = await Author.findOne({name: args.author})
        
        const book = new Book( { ...args, author: author})

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }

        try{
          book.save()
        }catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        return book
    },
    editAuthor: async (root, args, {currentUser}) => {
        const author = await Author.findOne({name: args.name})

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }

        if(!author){
            return null
        }

        author.born = args.setBornTo
        
        return author.save()
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args})

      try{
        author.save()
      }catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ ...args})
  
      try{
        user.save()
      }catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  }
}
const getCount = async (author) => {
    const books = await Book.find({}).populate('author', {name: 1})
    let count = 0;
    for ( const val of books){
        if(val.author.name === author){
            count++;
        }
    }
    console.log(author, count);
    return count
}

const getAuthorBooks = async (args) => {
    
    const books = await Book.find({}).populate("author",{name:1, born: 1});

    if(args.author !== undefined){

      const authorBooks = books.filter(book => book.author.name === args.author)
              if(args.genre !== undefined){
            const bo = authorBooks.filter(book => book.genres.includes(args.genre))
            
            return bo
        }
        return authorBooks
    }else if(args.genre !== undefined){
        const genreBooks = books.filter(book => book.genres.includes(args.genre))
        return genreBooks
    }else{
        return books
    }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})