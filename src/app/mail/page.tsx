import { ModeToggle } from "@/components/ui/theme-toggle";
import { Mail } from "./mail";

const MailDashboard = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <ModeToggle />
      </div>
      <Mail
        defaultLayout={[20, 32, 48]}
        navCollapsedSize={0}
        defaultCollapsed={false}
      />
    </>
  );
};

export default MailDashboard;
