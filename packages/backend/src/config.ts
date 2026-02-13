import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Also try to load from backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default {};
