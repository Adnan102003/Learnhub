# Create all placeholder page files
$pages = @(
    "pages\public\CourseCatalog.jsx",
    "pages\public\CourseDetail.jsx",
    "pages\student\StudentDashboard.jsx",
    "pages\student\MyLearning.jsx",
    "pages\student\CoursePlayer.jsx",
    "pages\student\Certificates.jsx",
    "pages\instructor\InstructorDashboard.jsx",
    "pages\instructor\CreateCourse.jsx",
    "pages\instructor\EditCourse.jsx",
    "pages\instructor\CourseBuilder.jsx",
    "pages\instructor\InstructorAnalytics.jsx",
    "pages\admin\AdminDashboard.jsx",
    "pages\admin\UserManagement.jsx",
    "pages\admin\CourseManagement.jsx",
    "pages\common\Profile.jsx",
    "pages\common\Settings.jsx"
)

foreach ($page in $pages) {
    $pageName = ($page -split '\\')[-1] -replace '\.jsx', ''
    $content = @"
import React from 'react';

const $pageName = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">$pageName</h1>
        <p className="text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default $pageName;
"@
    New-Item -ItemType File -Path $page -Value $content -Force
    Write-Host "Created $page" -ForegroundColor Green
}