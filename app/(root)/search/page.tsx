import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";




async function Page() {

    const user = await currentUser();

    if (!user) {
        return null;
    }

    // Copy & paste these codes from create-thread page.tsx, but there is a difference.
    // There is a reason we use "params.id" instead of "user.id" for fetchUser()
    // We can click profile's image to see a user's profile, 
    // that means we can see other user's profile as well, 
    // so "user.id" must not be used for fetchUser()
    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    } 


    // Fetch users
    const result = await fetchUsers({
        userId : user.id,
        searchString : "",
        pageNumber : 1,
        pageSize : 25
    });









    return (
        <section>
            <h1 className="head-text mb-10">Search</h1>

            {/* Search bar */}

            <div className="mt-14 flex flex-col gap-9">
                {result.users.length === 0 ? (
                    <p className="no-result">No users</p>
                ) : (
                    <>
                        {result.users.map((person) => (
                            <UserCard
                                key={person.id}
                                id={person.id}
                                name={person.name}
                                username={person.username}
                                imgUrl={person.image}
                                personType="User"
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    );
}

export default Page;