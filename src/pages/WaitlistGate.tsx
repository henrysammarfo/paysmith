import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Public auth is closed during waitlist-only beta. */
const WaitlistGate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/#waitlist", { replace: true });
  }, [navigate]);

  return null;
};

export default WaitlistGate;
