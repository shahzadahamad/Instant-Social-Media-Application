import { getUserDataById } from "@/apis/api/userApi";
import { setCallerState } from "@/redux/slice/chatSlice";
import { RootState } from "@/redux/store/store";
import { socket } from "@/socket/socket";
import { userData } from "@/types/profile/profile";
import { AxiosError } from "axios";
import { Camera, CameraOff, Mic, MicOff, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Peer from "simple-peer"

const VideoAudioCall = () => {

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isVideo = Boolean(queryParams.get('isVideo'));
  const userId = queryParams.get('userId');

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { callerDetials } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isVideoBlocked, setIsVideoBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const [me, setMe] = useState();
  const [userData, setUserData] = useState<userData>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(true)
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null)
  const connectionRef = useRef<Peer.Instance | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      const userData = await getUserDataById(userId);
      setUserData(userData);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.log(error);
        const errorMsg = error.response.data?.error || "An error occurred";
        console.error(errorMsg);
        toast.error("Page not found.");
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        setIsLoading(false);

        // Check if permissions are blocked
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        setIsAudioBlocked(!audioTrack);
        setIsVideoBlocked(!videoTrack);
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setIsLoading(false);
        if (err.name === "NotAllowedError") {
          setIsAudioBlocked(true);
          setIsVideoBlocked(true);
        }
      });

    socket.on("me", (id) => {
      setMe(id)
    });

  }, [callerDetials]);

  // Assign stream to video element after rendering
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, isVideoOff, isAudioBlocked, callAccepted]);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const callUser = (userId: string) => {
    if (!stream) {
      console.error("Stream is not available");
      return;
    }
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream as MediaStream
    });

    peer.on('signal', (data) => {
      socket.emit("callUser", {
        userId: userId,
        signalData: data,
        _id: currentUser?._id,
        from: me,
        isVideo: isVideo
      })
    })

    peer.on('stream', (stream) => {
      console.log('call user stream')
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    })

    connectionRef.current = peer;
  }

  const answerCall = () => {
    if (!stream) {
      console.error("Stream is not available");
      return;
    }
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: callerDetials.callerSocketId,
      })
    });

    peer.on('stream', (stream) => {
      console.log('reciver user stream')
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    if (callerDetials.callerSignal) {
      peer.signal(callerDetials.callerSignal);
    }
    connectionRef.current = peer;
  }

  const leaveCall = () => {
    setCallEnded(true);
    dispatch(setCallerState({ receivingCall: false, callerSocketId: "", callerSignal: null, callerId: "", isVideo: false }))
    if (connectionRef && connectionRef.current) {
      connectionRef.current.destroy();
    }
  }

  return (
    <div className="flex gap-4 items-center justify-center w-screen h-screen p-4">
      {
        callAccepted ?
          <div className="relative w-full h-full">
            {/* Main video (other user) */}
            <div className="relative w-full h-full bg-gray-800 flex items-center justify-center rounded-lg">
              {
                !isVideoOff ? (
                  <>
                    <video ref={userVideo} playsInline muted={isMuted} autoPlay className="w-full h-full object-contain rounded-lg" />
                  </>
                ) : <CameraOff className="w-1/2 h-1/2 text-gray-500" />
              }
              {/* Self video (draggable) */}
              <div
                className="absolute bottom-3 right-3 w-64 h-44 flex items-center text-center justify-center bg-gray-700 cursor-grab rounded-lg overflow-hidden shadow-lg select-none"
              >
                {/* Show loading while waiting for permissions */}
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="loader w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <h1 className="text-white text-lg mt-2">Loading...</h1>
                  </div>
                ) : isVideoBlocked || isAudioBlocked ? (
                  <h1 className="text-white text-lg">You've blocked access to your camera or microphone</h1>
                ) : stream && !isVideoOff ? (
                  <video ref={myVideo} playsInline muted={isMuted} autoPlay className="w-full h-full object-contain" />
                ) : (
                  <CameraOff className="w-1/2 h-1/2 text-gray-500" />
                )}
              </div>
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleVideo}
                disabled={isVideoBlocked}
                className={`p-4 rounded-full ${!isVideoOff ? 'bg-gray-700' : 'bg-red-600'
                  } hover:bg-opacity-90 transition-colors`}
              >
                {isVideoOff ? <CameraOff className="w-6 h-6 text-white" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={toggleAudio}
                disabled={isAudioBlocked}
                className={`p-4 rounded-full ${!isMuted ? 'bg-gray-700' : 'bg-red-600'
                  } hover:bg-opacity-90 transition-colors`}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}

              </button>
              {
                callAccepted && !callEnded && (
                  <button
                    onClick={leaveCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </button>
                )
              }
            </div>
          </div>
          : (
            <>
              {/* Video Section */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden w-3/5 h-4/5 flex flex-col justify-end">
                <div className="relative aspect-video w-full h-full flex items-center justify-center">
                  {/* Show loading while waiting for permissions */}
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="loader w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <h1 className="text-white text-lg mt-2">Loading...</h1>
                    </div>
                  ) : isVideoBlocked || isAudioBlocked ? (
                    <h1 className="text-white text-lg">You've blocked access to your camera or microphone</h1>
                  ) : stream && !isVideoOff ? (
                    <video ref={myVideo} playsInline muted={isMuted} autoPlay className="w-full h-full object-cover" />
                  ) : (
                    <CameraOff className="w-1/2 h-1/2 text-gray-500" />
                  )}
                </div>

                {/* Control Buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  {/* Video Toggle Button */}
                  <button
                    className={`p-3 rounded-full ${isVideoOff ? "bg-red-500 hover:bg-red-400" : "bg-gray-800 hover:bg-gray-700"
                      } transition-colors`}
                    onClick={toggleVideo}
                    disabled={isVideoBlocked}
                  >
                    {isVideoOff ? <CameraOff className="w-5 h-5 text-white" /> : <Camera className="w-5 h-5 text-white" />}
                  </button>

                  {/* Audio Toggle Button */}
                  <button
                    className={`p-3 rounded-full ${isMuted ? "bg-red-500 hover:bg-red-400" : "bg-gray-800 hover:bg-gray-700"
                      } transition-colors`}
                    onClick={toggleAudio}
                    disabled={isAudioBlocked}
                  >
                    {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                </div>
              </div>

              {/* User Info & Call Button */}
              <div className="bg-gray-900 p-6 rounded-lg w-1/4 h-4/5 flex flex-col justify-center items-center gap-7">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-800">
                  <img src={userData?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <h2 className="text-white text-2xl font-bold">{userData?.fullname}</h2>
                  <p className="text-gray-400 text-sm">Ready to call?</p>
                </div>


                <button onClick={() => {
                  if (userData) {
                    if (callerDetials.receivingCall && !callAccepted) {
                      answerCall();
                    } else if (!callAccepted && callEnded) {
                      callUser(userData._id);
                    }
                  }
                }} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  {!callAccepted && callerDetials.receivingCall ? "Join Call" : callEnded && !callAccepted && "Start Call"}
                </button>


              </div>
            </>
          )
      }
    </div>
  )
};

export default VideoAudioCall;
