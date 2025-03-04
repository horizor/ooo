import formidable from "formidable"
import path from "path"
import fs from "fs"
import axios from "axios"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    console.log("Starting file upload processing...")

    if (!process.env.ARK_API_KEY) {
      console.error("ARK_API_KEY not configured")
      return res.status(500).json({ message: "Server configuration error: API Key not set" })
    }

    // Update formidable configuration
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      multiples: false,
    })

    // Parse the form data
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
          return
        }
        resolve({ fields, files })
      })
    })

    const { files } = formData

    if (!files || !files.file) {
      console.error("No file received")
      return res.status(400).json({ message: "No uploaded file found" })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    console.log("File received:", file.originalFilename)

    // Check file format
    const supportedFormats = [".png", ".jpg", ".jpeg"]
    const fileExt = path.extname(file.originalFilename).toLowerCase()

    if (!supportedFormats.includes(fileExt)) {
      console.error("Unsupported file format:", fileExt)
      return res.status(400).json({
        message: "Unsupported file format, Doubao model only supports: " + supportedFormats.join(", "),
      })
    }

    // Read file content
    const fileData = await fs.promises.readFile(file.filepath)
    const base64Data = fileData.toString("base64")

    // Determine image format for the data URL
    let imageFormat = "jpeg"
    if (fileExt === ".png") {
      imageFormat = "png"
    }

    const fileUrl = `data:image/${imageFormat};base64,${base64Data}`

    // Call Doubao model API
    console.log("Calling Doubao Vision Pro model...")

    const response = await axios.post(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        model: "doubao-vision-pro-32k-2410128",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract all text content from this image, maintaining the original format. If it's a table, preserve the table structure. If there is no text content, output NO",
              },
              {
                type: "image_url",
                image_url: {
                  url: fileUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        top_p: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ARK_API_KEY}`,
        },
      },
    )

    // Clean up temporary file
    await fs.promises.unlink(file.filepath)

    console.log("Text extraction completed")

    // Return the extracted text content
    const extractedText = response.data.choices[0].message.content
    res.status(200).json({
      content: extractedText,
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype,
      },
    })
  } catch (error) {
    console.error("Server processing error:", error)
    res.status(500).json({
      message: "Server processing error",
      error: error.message,
    })
  }
}

