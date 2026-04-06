import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#05070e]">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-sm normal-case",
            card: "bg-[#060813] border border-white/5 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
            socialButtonsBlockButtonText: "text-white",
            dividerLine: "bg-white/10",
            dividerText: "text-gray-500",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            footerActionText: "text-gray-400",
            footerActionLink: "text-indigo-400 hover:text-indigo-300"
          }
        }}
      />
    </div>
  );
}
