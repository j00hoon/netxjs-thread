import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";



async function Page({ params } : { params : { id : string }}) {

    const user = await currentUser();

    if (!user) {
        return null;
    }

    // Copy & paste these codes from create-thread page.tsx, but there is a difference.
    // There is a reason we use "params.id" instead of "user.id" for fetchUser()
    // We can click profile's image to see a user's profile, 
    // that means we can see other user's profile as well, 
    // so "user.id" must not be used for fetchUser()
    const userInfo = await fetchUser(params.id);

    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    } 





    return (
        <section>
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div>
                
            </div>
        </section>
    );
}

export default Page;