import { FunctionalComponent } from "preact"
import { User } from "@/db/user.ts"

const Profile: FunctionalComponent<User> = (props) => {
  return (
    <a className="flex p-4 gap-4 border-t" href="/app">
      <div className="shadow-md">
        <img
          className="size-10 rounded-box"
          src={props.avatar}
        />
      </div>
      <div>
        <div className="uppercase font-semibold ">
          {props.username}
        </div>
        <div class="opacity-60 text-xs ">
          {props.email}
        </div>
      </div>
    </a>
  )
}

export default Profile
