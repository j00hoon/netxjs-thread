import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";




// In NextJs,
// how do we get the params from URL?
// Destructure it!
// We get the "params", and this "params" has an "id" which type is "string"
const Page = async ({ params } : { params : { id : string }}) => {

    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding")

    const thread = await fetchThreadById(params.id);

    


    return (
        <section className="relative">
            <div>
                <ThreadCard 
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ""} // or go to ThreadCard.tsx and then change the type of "currentUserId" of interface Props as "string | undefined"
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>

            <div className="mt-7">
                <Comment
                    threadId={thread.id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className="mt-10">
                {thread.children.map((childItem : any) => (
                    <ThreadCard 
                        key={childItem._id}
                        id={childItem._id}
                        currentUserId={user?.id || ""} // or go to TheradCard.tsx and then change the type of "currentUserId" of interface Props as "string | undefined"
                        parentId={childItem.parentId}
                        content={childItem.text}
                        author={childItem.author}
                        community={childItem.community}
                        createdAt={childItem.createdAt}
                        comments={childItem.children}
                        isComment
                    />
                ))}
            </div>
        </section>
    );
}

export default Page;