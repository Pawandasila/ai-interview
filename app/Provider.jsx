"use client";

import React, { useContext, useEffect, useState } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";

const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CreateNewUser();
  }, []);

  const CreateNewUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
  
    if (authUser) {
      let { data: Users } = await supabase
        .from("Users")
        .select("*")
        .eq("email", authUser.email);
  
      if (Users.length === 0) {
        const { data } = await supabase
          .from("Users")
          .insert([
            {
              name: authUser.user_metadata?.name,
              email: authUser.email,
              picture: authUser.user_metadata?.picture,
            },
          ])
          .select()
          .single();
        setUser(data);
      } else {
        setUser(Users[0]);
      }
    }
  
    setLoading(false);
  };
  

  return (
    <UserDetailContext.Provider value={{ user, setUser, loading }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
};

export default Provider;

export const useUser = () => {
  const context = useContext(UserDetailContext);
  return context;
};
