import { getLogin } from "@/effects/apis";

export default function Login() {
  const handleClickLoginButton = async () => {
    const { redirect_uri } = await getLogin();
    location.href = redirect_uri;
  };

  return <button onClick={handleClickLoginButton}>로그인</button>;
}
