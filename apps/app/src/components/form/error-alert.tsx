type FormErrorAlertProps = {
  message: string | null;
};

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="slide-in-from-top-2 animate-in rounded-lg bg-destructive/10 p-3 text-destructive text-sm duration-200">
      {message}
    </div>
  );
}
