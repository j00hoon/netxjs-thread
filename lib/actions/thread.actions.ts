"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";



interface Params {
    text : string,
    author : string,
    communityId : string | null,
    path : string,
}

export async function createThread({ text, author, communityId, path } : Params) {
    connectToDB();
    
    try {
        const createdThread = await Thread.create({
            text,
            author,
            community : null,
        });

        // Update user model
        await User.findByIdAndUpdate(author, {
            $push : { threads : createdThread._id },
        })

        revalidatePath(path);
    } catch (error : any) {
        throw new Error(`Failed to create a new thread : ${error.message}`);
    }
}




export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;


    // Fetch the posts that have no parents. (Top-level threads)
    const postsQuery = Thread.find({ parentId : { $in : [null, undefined]}})
        .sort({ createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path : 'author', model : User })
        .populate({ 
            path : 'children', 
            populate : {
                path : 'author',
                model : User,
                select : "_id name parentId image"
            }
        })

    // Only count the top level threads
    const totalPostsCount = await Thread.countDocuments({ parentId : { $in : [null, undefined]} })

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };

}






export async function fetchThreadById(id : string) {
    connectToDB();

    try {

        // Todo: populate community
        const thread = await Thread.findById(id)
            .populate({
                path : "author",
                model : User,
                select : "_id id name image"
            })
            .populate({
                path : "children",
                populate : [{
                    path : "author",
                    model : User,
                    select : "_id id name parentId image"
                },
                {
                    path : "children",
                    model : Thread,
                    populate : {
                        path : "author",
                        model : User,
                        select : "_id id name parentId image"
                    }
                }
            ]
        }).exec();

        return thread;
    } catch (error : any) {
        throw new Error(`Error fetching thread : ${error.message}`);
    }
}








export async function addCommentToThread(
    threadId : string,
    commentText : string,
    userId : string,
    path : string 
) {
    connectToDB();

    try {
        // adding a comment
        // 1. Find the original thread by its ID
        const originalThread = await Thread.findById(threadId);
        if (!originalThread) {
            throw new Error("Thread not found");
        }

        // 2. Create a new thread with the comment text
        const commentThread = new Thread({
            text : commentText,
            author : userId,
            parentId : threadId,
        });

        // 3. Save the new thread
        const savedCommentThread = await commentThread.save();

        // 4. Update the original thread to include the new comment
        originalThread.children.push(savedCommentThread._id);

        // 5. Save the original thread
        await originalThread.save();

        // 6. Purge the cache data
        revalidatePath(path);

    } catch (error : any) {
        throw new Error(`Error adding comment to thread : ${error.message}`);
    }

}





