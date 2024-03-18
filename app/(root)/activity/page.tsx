import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";






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


    // getActivity
    const activity = await getActivity(userInfo._id);










    return (
      <section>
          <h1 className="head-text mb-10">Activity</h1>

          <section className="mt-10 flex flex-col gap-5">
            {activity.length > 0 ? (
              <>
                {activity.map((activity) => (
                  <Link
                    key={activity._id}
                    href={`/thread/${activity.parentId}`}
                  >
                    <article className="activity-card">
                      <Image 
                        src={activity.author.image}
                        alt="Profile picture"
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />

                      <p className="!text-small-regular text-light-1">
                        <span className="mr-1 text-primary-500">
                          {activity.author.name}
                        </span> {" "}
                        replied to your thread
                      </p>

                    </article>
                  </Link>
                ))}
              </>
              )
              : 
              <p className="!text-base-regular text-light-3">
                No activity yet
              </p>
            }
          </section>
      </section>
    );
  }
  
  export default Page;