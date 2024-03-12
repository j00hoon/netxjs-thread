import * as z from "zod";




export const ThreadValidation = z.object({
    thread : z.string().min(3, "Thread should be longer than 3 characters."),
    accountId : z.string(),
})


export const CommentValidation = z.object({
    thread : z.string().min(3, "Thread should be longer than 3 characters."),
})

