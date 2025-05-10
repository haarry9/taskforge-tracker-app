
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoards } from '@/hooks/useBoards';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

type InvitationAction = 'accept' | 'decline';

export function InvitationHandler() {
  const { invitationId, action } = useParams<{ invitationId: string, action: InvitationAction }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { useUpdateInvitationStatusMutation } = useBoards();
  const updateInvitation = useUpdateInvitationStatusMutation();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your response...');
  
  useEffect(() => {
    const processInvitation = async () => {
      if (isAuthLoading) return;
      
      if (!user) {
        // User is not logged in, save the invitation info and redirect to login
        sessionStorage.setItem('pendingInvitation', JSON.stringify({ 
          invitationId, 
          action: action || 'accept'
        }));
        navigate('/auth?redirect=invitation');
        return;
      }
      
      if (!invitationId || !action || (action !== 'accept' && action !== 'decline')) {
        setStatus('error');
        setMessage('Invalid invitation link');
        return;
      }
      
      try {
        const result = await updateInvitation.mutateAsync({
          invitationId,
          status: action
        });
        
        if (result) {
          setStatus('success');
          setMessage(action === 'accept' 
            ? 'You have successfully joined the board!' 
            : 'You have declined this invitation.');
            
          // For accepted invitations, redirect to dashboard after a short delay
          if (action === 'accept') {
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('There was an issue processing your response.');
        }
      } catch (error) {
        console.error("Error handling invitation:", error);
        setStatus('error');
        setMessage('An error occurred while processing your response.');
      }
    };
    
    processInvitation();
  }, [invitationId, action, user, isAuthLoading, updateInvitation, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full p-6 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            {action === 'accept' ? (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-6 w-6 text-gray-600" />
              </div>
            )}
            <h2 className="text-xl font-semibold">
              {action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined'}
            </h2>
            <p className="text-gray-600">{message}</p>
            
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
