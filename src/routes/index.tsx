import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { HealthCheckPage } from '../pages/HealthCheckPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PublicInvitationPage } from '../pages/PublicInvitationPage';
import { HostPanelPage } from '../pages/HostPanelPage';
import { DesignDemoPage } from '../pages/DesignDemoPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'health',
        element: <HealthCheckPage />,
      },
      {
        path: 'admin',
        element: <LoginPage />,
      },
      {
        path: 'admin/dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'demo/:designSlug',
        element: <DesignDemoPage />,
      },
      {
        path: 'i/:token',
        element: <PublicInvitationPage />,
      },
      {
        path: 'host/:token',
        element: <HostPanelPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
