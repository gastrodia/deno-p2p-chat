import { FunctionalComponent } from "preact";

const Profile: FunctionalComponent = () => {
  return (
    <a className="flex p-4 gap-4" href="/">
      <div>
        <img
          className="size-10 rounded-box"
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        />
      </div>
      <div>
        <div className="uppercase font-semibold ">
          deno
        </div>
        <div class="opacity-60 text-xs ">
            3025822868@qq.com
        </div>
      </div>
    </a>
  );
};

export default Profile;
