import { Suspense } from "react";
import { Await, Outlet, useLoaderData } from "react-router-dom";

import { TGetAuthMeResponse } from "@/effects/apis.model";
import Login from "@/features/auth/Login";
import Avatar from "@/ui/avatar/Avatar";
import GNB from "@/ui/layout/GNB";

import classNames from "./Layout.module.css";

export default function Layout() {
  const { me } = useLoaderData() as { me: Promise<TGetAuthMeResponse> };

  return (
    <div className={classNames.container}>
      <GNB
        rightSection={
          <Suspense fallback={<div></div>}>
            <Await
              resolve={me}
              errorElement={<Login />}
              children={(resolvedMe) => <Avatar src={resolvedMe.picture} />}
            />
          </Suspense>
        }
      />
      <main className={classNames.content}>
        <Outlet />
      </main>
    </div>
  );
}
