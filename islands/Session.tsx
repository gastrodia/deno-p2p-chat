const Session = () => {
  const list = [1, 2, 3, 4, 5];
  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      <li className="p-4 tracking-wide">
        对话
      </li>
      {list.map((item) => (
        <li className="list-row">
          <div>
            <img
              className="size-10 rounded-box"
              src={`https://img.daisyui.com/images/profile/demo/${item}@94.webp`}
            />
          </div>
          <div>
            <div>Dio Lupa</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              Remaining Reason
            </div>
          </div>
        </li>
      ))}
      <li className="p-4 pb-2 tracking-wide">
        在线的陌生用户
      </li>
      {list.map((item) => (
        <li className="list-row">
          <div>
            <img
              className="size-10 rounded-box"
              src={`https://img.daisyui.com/images/profile/demo/${item}@94.webp`}
            />
          </div>
          <div>
            <div>Dio Lupa</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              Remaining Reason
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Session;
