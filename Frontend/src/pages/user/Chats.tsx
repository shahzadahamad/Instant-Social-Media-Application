import ChatInboxDetials from "@/components/chats/ChatInboxDetials";
import Sidebar from "@/components/common/Sidebar";

const Chats = () => {
  return (
    <div className="flex h-screen">
      <Sidebar page={"chat"} />
      <ChatInboxDetials />
    </div>
  );
};

export default Chats;
