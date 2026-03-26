import { clerkClient } from "@clerk/nextjs/server"


const authAdmin = async (userId) => {
    try {
        if(!userId) return false

        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const userEmail = user.emailAddresses[0].emailAddress
        const adminEmails = process.env.ADMIN_EMAIL.split(',').map(email => email.trim())

        return adminEmails.includes(userEmail)
    } catch (error) {
        console.error(error)
        return false
    }
}

export default authAdmin