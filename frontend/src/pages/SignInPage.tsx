import { useState } from "react";
import { useSignIn } from "@/hooks/useSignIn";
import { SignInForm } from "@/components/signIn/SignInForm";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
    const { signIn, isLoading, error } = useSignIn();
    const [errors, setErrors] = useState<Record<string, string> | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username: string = formData.get('username') as string;

        if (!username) {
            setErrors({ username: 'Username is required' });
            return;
        }

        if (username.length < 3) {
            setErrors({ username: 'Username must be at least 3 characters long' });
            return;
        }

        if (username === 'admin') {
            setErrors({ username: 'Invalid username' });
            return;
        }

        setErrors(null);

        try {
            await signIn(username);
            navigate("/chats");
        } catch {
            // ignore
        }
    };

    return (
        <div>
            <SignInForm isSubmitting={isLoading} errors={errors} error={error} onSubmit={handleSubmit} />
        </div>
    );
}