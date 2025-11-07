/**
 * Speaking Task Component
 * Audio recording with MediaRecorder API
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SpeakingTaskProps {
  onComplete: (audioBase64: string) => void;
}

export default function SpeakingTask({ onComplete }: SpeakingTaskProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 120; // 2 minutes

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      setError('Failed to access microphone. Please allow microphone access.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      onComplete(base64Audio);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (recordingTime / MAX_DURATION) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎤 Speaking Task</CardTitle>
        <CardDescription>
          Speak in French for up to 2 minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Prompt:</h3>
          <p className="text-gray-700">
            Parlez de votre journée typique. Décrivez ce que vous faites le matin, l'après-midi et le soir. 
            Essayez d'utiliser des verbes pronominaux et le présent de l'indicatif.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center space-y-4">
          {!isRecording && !audioBlob && (
            <Button onClick={startRecording} size="lg" className="px-8">
              🎤 Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <Button onClick={stopRecording} variant="destructive" size="lg">
                ⏹️ Stop Recording
              </Button>
              
              <p className="text-sm text-gray-500">
                Maximum: {formatTime(MAX_DURATION)}
              </p>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-700">✅ Recording Complete!</p>
                <p className="text-sm text-gray-600">
                  Duration: {formatTime(recordingTime)}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  variant="outline"
                >
                  🔄 Re-record
                </Button>
                
                <Button onClick={handleSubmit} size="lg">
                  Continue to Writing →
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 Tip: Speak clearly and at a moderate pace for best results
        </div>
      </CardContent>
    </Card>
  );
}

