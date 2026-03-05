import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not set. Database features will be disabled.')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db> {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not configured. Please set up your database connection.')
    }
    
    if (!clientPromise) {
      throw new Error('MongoDB client not initialized')
    }
    
    console.log("Attempting to connect to MongoDB...")
    const client = await clientPromise
    const db = client.db('codetrack')
    console.log("Successfully connected to MongoDB")
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isDatabaseAvailable(): boolean {
  return !!uri && !!clientPromise
}

export default clientPromise