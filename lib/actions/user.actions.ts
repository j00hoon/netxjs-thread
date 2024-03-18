"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { StringValidation } from "zod";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";




interface Params {
    userId : string | undefined;
    username : string;
    name : string;
    bio : string;
    image : string;
    path : string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path
} : Params) : Promise<void> {
    
    try {
        connectToDB();

        await User.findOneAndUpdate(
            { id : userId },
            {
                username : username.toLowerCase(),
                name,
                bio,
                image,
                onboarded : true,
            },
            { upsert : true }
        );
    
        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error : any) {
        throw new Error(`Failed to create/update user : ${error.message}`);
    }
}


















export async function fetchUser(userId : string) {
    try {
        connectToDB();

        return await User
            .findOne({ id : userId })
            // .populate({
            //     path : "communities",
            //     model : Community
            // })
    } catch (error : any) {
        throw new Error(`Failed to fetch user : ${error.message}`);
    }
}










export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all threads authored by user with the given userId
        // Todo Populate community
        const threads = await User.findOne({ id : userId })
            .populate({
                path : "threads",
                model : Thread,
                populate : {
                    path : "children",
                    model : Thread,
                    populate : {
                        path : "author",
                        model : User,
                        select : "name image id"
                    }
                }
            })

            return threads;
    } catch (error : any) {
        throw new Error(`Failed to fetch user posts ${error.message}`);
    }
}





export async function fetchUsers({ 
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
 } : {
    userId : string;
    searchString? : string;
    pageNumber? : number;
    pageSize? : number;
    sortBy? : SortOrder
 }) {
    try {
        connectToDB();

        // Skip how many serach results
        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        // Fetch query and search conditions
        const query: FilterQuery<typeof User> = {
            // $ne means "not equals"
            // we want to search all users, but filtered out myself
            id : { $ne : userId }
        }

        // Actual searching
        if (searchString.trim() !== "") {
            query.$or = [
                // Searching for by "username" and "name" both
                // because in case you know only someone by username or name
                { username : { $regex : regex }},
                { name : { $regex : regex }}
            ]
        }

        // Sorting
        const sortOptions = { createdAt : sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        // To find out the total number of pages for the users
        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error: any) {
        throw new Error(`Failed to fetch users : ${error.message}`);
    }
}






export async function getActivity(userId : string) {
    try {
        connectToDB();

        // find all threads created by the user
        const userThreads = await Thread.find({ author : userId });

        // collect all the child threads ids (replies) from the 'children' field
        // and then create a new array "childThreadIds"
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        const replies = await Thread.find({
            _id : { $in : childThreadIds },
            author : { $ne : userId }
        }).populate({
            path : "author",
            model : User,
            select : "name image _id"
        })

        return replies;
    } catch (error : any) {
        throw new Error(`Failed to fetch activity : ${error.message}`);
    }
}