"use client";
import { useState } from "react";
import { useUser } from "@/components/hooks/useUser";

// We no longer need props as we get user from context
export default function NewProjectChat() {
  const { user } = useUser();
  // State for the chat flow
  const [step] = useState<"start" | "continue" | "end">("start");

  // Basic component that displays user info and chat step
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded">
        <h3 className="font-medium">New Project Chat</h3>
        <p>Current step: {step}</p>
        {user && (
          <div className="mt-2">
            <p>User: {user.email}</p>
          </div>
        )}

        <pre>{user ? JSON.stringify(user, null, 2) : "No user logged in"}</pre>
      </div>
      {/* Add actual chat functionality here */}
    </div>
  );
  // const [message, setMessage] = useState<string>("");

  // // Add user ID to chat payload when available
  // const payload = user ? { userId: user.id } : {};
  // const { data, isLoading, error } = useChat({ step, payload });
  // console.log("Chat data:", data, "Loading:", isLoading, "Error:", error);
  // useEffect(() => {
  //   const fetchUserImage = async () => {
  //     const { data, error } = await createClient().auth.getSession();
  //     if (error) {
  //       console.error(error);
  //     }

  //     console.log("client", data);
  //   };
  //   fetchUserImage();
  // }, []);

  // When user status changes, update the chat if needed
  // useEffect(() => {
  //   if (user && !userLoading) {
  //     // User is logged in, we could potentially reset or update the chat
  //   }
  // }, [user, userLoading]);

  // const handleSubmit = (value: string) => {
  //   setMessage(value);
  //   // Progress to the next step in the chat
  //   setStep("continue");
  // };

  return (
    <div>
      <h2>New Project Chat User Id: </h2>
    </div>
  );
}
