import expressApp from './app'

const PORT = process.env.PORT || 8000

export const StartServer = async () => {
  expressApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })

  process.on('unhandledRejection', (error) => {
    console.log(`Unhandled rejection: ${error}`)
    process.exit(1)
  })
}

StartServer().then(() => console.log('Server started'))