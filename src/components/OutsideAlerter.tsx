import React, { useEffect, useRef } from 'react';

function useOutsideAlerter(ref, handleClick) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handleClick();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideAlerter({
  handleClickOutside,
  children,
}: {
  handleClickOutside: () => void;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, handleClickOutside);

  return <div ref={wrapperRef}>{children}</div>;
}
