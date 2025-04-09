// 获取随机头像

const BASE_URL = `https://xsgames.co/randomusers/avatar.php?g=pixel`;

const randomAvatar = async () => {
  // 返回base64
  const response = await fetch(BASE_URL);
  return response.url;
};

export default randomAvatar;
