export const syncUserProfile = async (
    userId: string,
    username: string
): Promise<void> => {
    try {
        const userServiceUrl = process.env.USER_SERVICE_URL || "http://ramzharf-user-service:3003";

        const response = await fetch(`${userServiceUrl}/api/user/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: userId, username }),
        });

        if (!response.ok) {
            console.error("Failed to sync user profile:", await response.text());
        }
    } catch (error) {
        console.error("Error syncing user profile:", error);
    }
};

