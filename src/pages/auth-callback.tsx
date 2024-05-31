import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/Loader";
import { useAuthCallbackQuery } from "@/effects/apis";
import classNames from "@/pages/auth-callback.module.css";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const qs = {
    state: searchParams.get("state") ?? "",
    code: searchParams.get("code") ?? "",
  };
  const { data: auth } = useAuthCallbackQuery(qs);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) navigate("/");
  }, [auth, navigate]);

  return (
    <main className={classNames.container}>
      <Spinner /> 로그인 중입니다.
    </main>
  );
}
