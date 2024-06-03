import { getAuthLogin } from "@/effects/apis";

export default function Login() {
  const handleClickLoginButton = async () => {
    const { redirect_uri } = await getAuthLogin();
    location.href = redirect_uri;
  };

  return <button onClick={handleClickLoginButton}>로그인</button>;
}
