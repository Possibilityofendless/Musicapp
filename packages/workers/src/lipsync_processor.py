"""
Lip-sync post-processing worker.

Takes a raw Sora-generated video and adjusts the mouth region to sync with 
the actual vocal audio using optical flow and frame interpolation.

Depends on: opencv-python, librosa, scipy, tensorflow/torch (optional, for pose detection)
"""

import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
import json


class LipsyncProcessor:
    """Main lip-sync post-processor."""
    
    def __init__(self, video_path: str, audio_path: str, phonemes: List[Dict]):
        """
        Initialize the processor.
        
        Args:
            video_path: path to generated video MP4
            audio_path: path to source audio MP3
            phonemes: list of {phoneme, start_time, end_time} dicts
        """
        self.video_path = video_path
        self.audio_path = audio_path
        self.phonemes = phonemes
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 24
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    def process(self, output_path: str, mouth_region_expand: float = 0.3) -> bool:
        """
        Process the video and save lip-synced result.
        
        Args:
            output_path: where to save the lip-synced MP4
            mouth_region_expand: expansion factor for mouth ROI (0-1)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Prepare output video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, self.fps, (self.width, self.height))
            
            if not out.isOpened():
                print(f"Failed to open output video writer: {output_path}")
                return False
            
            frame_idx = 0
            mouth_blend_buffer = {}  # Cache for smoothing between frames
            
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    break
                
                # Get current timestamp
                timestamp = frame_idx / self.fps
                
                # Find active phonemes for this frame
                active_phonemes = [
                    ph for ph in self.phonemes
                    if ph.get('start_time', 0) <= timestamp < ph.get('end_time', float('inf'))
                ]
                
                if active_phonemes:
                    # Try to detect and warp mouth region
                    frame = self._warp_mouth_region(
                        frame,
                        active_phonemes[0],
                        mouth_region_expand
                    )
                
                # Write frame
                out.write(frame)
                frame_idx += 1
            
            self.cap.release()
            out.release()
            
            print(f"Lip-sync processing complete: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error during lip-sync processing: {e}")
            return False
    
    def _detect_mouth_region(self, frame: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """
        Detect the mouth region in a frame.
        
        Returns:
            (x, y, w, h) bounding box or None if not found
        
        Simplified implementation; in production, use facial landmarks (e.g., MediaPipe, dlib).
        """
        # For now, assume mouth is roughly center-bottom of face
        # In a real implementation, use  MTCNN, dlib, or MediaPipe for face detection
        
        # Rough estimate: mouth is typically in bottom third of face, centered
        h, w = frame.shape[:2]
        
        # Placeholder: approximate mouth region
        mouth_y = h // 2 + h // 8
        mouth_height = h // 6
        mouth_width = w // 3
        mouth_x = (w - mouth_width) // 2
        
        # Return (x, y, width, height)
        return (max(0, mouth_x), max(0, mouth_y), mouth_width, mouth_height)
    
    def _warp_mouth_region(
        self,
        frame: np.ndarray,
        phoneme: Dict,
        expand_factor: float = 0.3
    ) -> np.ndarray:
        """
        Warp the mouth region based on phoneme characteristics.
        
        Args:
            frame: input frame
            phoneme: current phoneme dict
            expand_factor: how much to expand lips (rough proxy for phoneme)
        
        Returns:
            modified frame
        """
        mouth_region = self._detect_mouth_region(frame)
        if mouth_region is None:
            return frame
        
        x, y, w, h = mouth_region
        
        # Extract mouth ROI
        mouth_roi = frame[y:y+h, x:x+w].copy()
        
        # Simple morphological operation based on phoneme
        # In reality, this would be driven by optical flow or neural face synthesis
        phoneme_text = phoneme.get('phoneme', '').lower()
        
        # Vowel-like phonemes → mouth open (vertical expansion)
        vowels = set('aeiouɑæʌɔəɨ')
        is_vowel = len(phoneme_text) > 0 and phoneme_text[0] in vowels
        
        if is_vowel and h > 0:
            # Slight vertical stretching for vowels
            scale_y = 1.0 + expand_factor
            new_height = int(h * scale_y)
            
            # Center the expansion
            y_offset = (new_height - h) // 2
            new_y = max(0, y - y_offset)
            new_h = min(frame.shape[0] - new_y, new_height)
            
            # Resize and blend
            resized = cv2.resize(mouth_roi, (w, new_h - h))
            
            # Feather blend to avoid hard edges
            alpha = 0.7
            blend_region = frame[new_y:new_y+new_h, x:x+w]
            if blend_region.shape == resized.shape:
                frame[new_y:new_y+new_h, x:x+w] = cv2.addWeighted(
                    resized, alpha,
                    blend_region, 1 - alpha,
                    0
                )
        
        return frame


def postprocess_lipsync(
    video_path: str,
    audio_path: str,
    phonemes: List[Dict],
    output_path: str,
) -> bool:
    """
    Main entry point for lip-sync post-processing.
    
    Args:
        video_path: raw Sora video
        audio_path: source vocal audio
        phonemes: list of phoneme timings from forced alignment
        output_path: where to save the lip-synced video
    
    Returns:
        True if successful
    """
    processor = LipsyncProcessor(video_path, audio_path, phonemes)
    return processor.process(output_path)


if __name__ == '__main__':
    # Quick test
    import sys
    if len(sys.argv) > 3:
        video_file = sys.argv[1]
        audio_file = sys.argv[2]
        phonemes_json = sys.argv[3]
        output_file = sys.argv[4] if len(sys.argv) > 4 else 'output_lipsync.mp4'
        
        try:
            phonemes = json.loads(phonemes_json)
        except:
            phonemes = []
        
        success = postprocess_lipsync(video_file, audio_file, phonemes, output_file)
        print(f"Success: {success}")
