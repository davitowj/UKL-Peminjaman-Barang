import Express from "express";
import userRoute from "./router/userRoute"
import inventoryRoute from "./router/inventoryRoute"
import borrowRoute from "./router/borrowRoute"

const app = Express()

app.use(Express.json())

app.use(`/api`, userRoute)
app.use(`/api`, inventoryRoute)
app.use(`/api`,  borrowRoute)


const PORT = 1995
app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`)
})