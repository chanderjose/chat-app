import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export function SignInForm({ error, errors, isSubmitting, onSubmit }: { error?: string, errors?: Record<string, string>, isSubmitting: boolean, onSubmit: (e: any) => void }) {
    return (
        <form onSubmit={onSubmit} className="bg-muted w-full h-screen flex items-center justify-center">
            <Card className='w-md'>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <Alert variant="destructive" className="max-w-md mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>}
                    <div className="grid gap-2">
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                minLength={3}
                                disabled={isSubmitting}
                                required
                            />
                            <FieldDescription>Enter at least 3 characters.</FieldDescription>
                            {errors?.username ? <FieldError>{errors.username}</FieldError> : null}
                        </Field>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Signing in..." : "Enter to chat"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
