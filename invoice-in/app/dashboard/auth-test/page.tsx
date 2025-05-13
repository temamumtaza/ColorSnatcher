"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkApiStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setApiStatus(data);
    } catch (error) {
      console.error("Error checking API status:", error);
      setApiStatus({ error: "Failed to fetch status" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
              {JSON.stringify({ status, session }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={checkApiStatus}
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? "Checking..." : "Refresh Status"}
            </Button>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
              {JSON.stringify(apiStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>
    </div>
  );
} 