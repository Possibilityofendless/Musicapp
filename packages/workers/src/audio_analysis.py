"""
Audio analysis worker — extracts beat grid, tempo, sections, and energy curve.

Depends on: librosa, scipy, numpy
"""

import librosa
import numpy as np
from typing import Dict, List, Any, Optional
import json


def analyze_audio(
    audio_path: str,
    sr: int = 22050,
) -> Dict[str, Any]:
    """
    Analyze an audio file for music structure.
    
    Args:
        audio_path: path to MP3 or WAV
        sr: sample rate (default 22050 Hz)
    
    Returns:
        dict with:
        - bpm: detected tempo in beats per minute
        - beats: list of beat times
        - sections: detected song sections (verse, chorus, etc.)
        - energy_curve: energy level over time
        - onset_times: transient attack times
    """
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=sr)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Detect tempo and beats
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, beats = librosa.beat.beat_track(onset_env=onset_env, sr=sr)
        beat_times = librosa.frames_to_time(beats, sr=sr)
        
        # Onset detection (transients)
        onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time')
        
        # Spectral centroid (brightness) — proxy for energy/mood
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        
        # RMS energy
        rms = librosa.feature.rms(y=y)[0]
        rms_normalized = rms / (rms.max() + 1e-8)
        
        # Time grid for energy curve
        frames = np.arange(len(rms))
        times = librosa.frames_to_time(frames, sr=sr)
        
        # Detect sections (simplified: using spectral flux)
        # In production, use librosa.segment.agglomerative or other methods
        sections = detect_sections(y, sr, beat_times)
        
        return {
            'bpm': float(tempo),
            'duration': float(duration),
            'beats': [
                {
                    'time': float(t),
                    'strength': 1.0,  # All beats equally strong for now
                }
                for t in beat_times
            ],
            'onsets': [float(t) for t in onsets],
            'energy_curve': [
                {
                    'time': float(times[i]),
                    'energy': float(rms_normalized[i]),
                }
                for i in range(0, len(times), max(1, len(times) // 100))  # Sample 100 points
            ],
            'sections': sections,
            'spectral_features': {
                'centroid_mean': float(np.mean(spectral_centroid)),
                'brightness': float(np.std(spectral_centroid)),
            }
        }
    except Exception as e:
        print(f"Error analyzing audio: {e}")
        return {
            'error': str(e),
            'bpm': 120.0,  # Default fallback
            'beats': [],
            'sections': [],
            'energy_curve': [],
        }


def detect_sections(y: np.ndarray, sr: int, beat_times: np.ndarray) -> List[Dict[str, Any]]:
    """
    Simple section detection based on spectral flux.
    
    Returns a list of detected sections with names and timings.
    In production, use more sophisticated methods or ML-based approaches.
    """
    # Compute chroma energy transpositions
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    
    # Compute onset strength as proxy for section changes
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    frames = np.arange(len(onset_env))
    times = librosa.frames_to_time(frames, sr=sr)
    
    # Find peaks in onset strength (likely section boundaries)
    peak_threshold = np.percentile(onset_env, 70)
    peaks = np.where(onset_env > peak_threshold)[0]
    peak_times = times[peaks]
    
    # Group peaks into sections
    sections = []
    if len(peak_times) > 0:
        # Snap to nearest beat
        beat_snapped = [min(beat_times, key=lambda b: abs(b - pt)) if len(beat_times) > 0 else pt 
                       for pt in peak_times]
        beat_snapped = sorted(set(beat_snapped))
        
        section_names = ['intro', 'verse', 'chorus', 'bridge', 'verse', 'chorus', 'outro']
        for i, start_time in enumerate(beat_snapped):
            end_time = beat_snapped[i + 1] if i + 1 < len(beat_snapped) else times[-1]
            sections.append({
                'name': section_names[i % len(section_names)],
                'start_time': float(start_time),
                'end_time': float(end_time),
                'type': 'structural',
            })
    
    return sections


def extract_vocal_segment(
    audio_path: str,
    start_time: float,
    end_time: float,
    sr: int = 22050,
) -> Optional[np.ndarray]:
    """
    Extract a vocal segment (e.g., for per-scene extraction).
    
    Args:
        audio_path: path to audio file
        start_time: segment start in seconds
        end_time: segment end in seconds
        sr: sample rate
    
    Returns:
        numpy array of audio samples for the segment, or None on error
    """
    try:
        y, sr = librosa.load(audio_path, sr=sr, mono=True)
        
        start_sample = int(start_time * sr)
        end_sample = int(end_time * sr)
        
        segment = y[start_sample:end_sample]
        return segment
    except Exception as e:
        print(f"Error extracting vocal segment: {e}")
        return None


def detect_phonemes_and_words(
    audio_path: str,
    transcript: str,
    sr: int = 22050,
) -> Dict[str, List[Dict[str, float]]]:
    """
    Detect phoneme and word boundaries using forced alignment (simplified).
    
    In production, use Montreal Forced Aligner (MFA) or Wav2Vec2 for real alignment.
    This is a placeholder that estimates boundaries from energy peaks.
    
    Args:
        audio_path: path to audio
        transcript: full text transcript
        sr: sample rate
    
    Returns:
        dict with 'phonemes' and 'words' arrays of {text, start_time, end_time}
    """
    try:
        y, sr = librosa.load(audio_path, sr=sr, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Placeholder: evenly distribute words over duration
        words = transcript.split()
        word_duration = duration / len(words) if len(words) > 0 else 1.0
        
        words_data = [
            {
                'text': word,
                'start_time': float(i * word_duration),
                'end_time': float((i + 1) * word_duration),
                'confidence': 0.9,  # Placeholder
            }
            for i, word in enumerate(words)
        ]
        
        # Phonemes: split each word into approximate syllables
        phonemes_data = []
        for word_obj in words_data:
            word = word_obj['text']
            word_start = word_obj['start_time']
            word_end = word_obj['end_time']
            word_duration = word_end - word_start
            
            # Very rough: assume 2-3 syllables per word
            num_syllables = max(1, len(word) // 3)
            syllable_duration = word_duration / num_syllables
            
            for syl_i in range(num_syllables):
                phonemes_data.append({
                    'phoneme': f"{word[0]}...",  # Placeholder
                    'start_time': float(word_start + syl_i * syllable_duration),
                    'end_time': float(word_start + (syl_i + 1) * syllable_duration),
                    'confidence': 0.8,
                })
        
        return {
            'words': words_data,
            'phonemes': phonemes_data,
        }
    except Exception as e:
        print(f"Error detecting phonemes: {e}")
        return {'words': [], 'phonemes': []}


if __name__ == '__main__':
    # Quick test
    import sys
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        result = analyze_audio(audio_file)
        print(json.dumps(result, indent=2))
