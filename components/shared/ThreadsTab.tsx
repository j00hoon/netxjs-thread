import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";



interface Props {
    currentUserId : string;
    accountId : string;
    accountType : string;
}


const ThreadsTab = async ({ currentUserId, accountId, accountType } : Props) => {

    // Todo : Fetch profile threads
    let result = await fetchUserPosts(accountId);

    if (!result) redirect("/");

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread : any) => (
                <ThreadCard 
                    key={thread._id}
                    id={thread._id}
                    currentUserId={currentUserId} // or go to TheradCard.tsx and then change the type of "currentUserId" of interface Props as "string | undefined"
                    parentId={thread.parentId}
                    content={thread.text}
                    author={accountType === "User" ? 
                        { name : result.name, image : result.image, id : result.id}
                        :
                        { name : thread.author.name, image : thread.author.image, id : thread.author.id}
                    } // Todo : Update whether I am the owner or not
                    community={thread.community} // Todo : Update whether I am the owner or not
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            ))}
        </section>
    );
}

export default ThreadsTab;