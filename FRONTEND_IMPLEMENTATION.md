# Frontend Implementation Guide - Next.js

## Cursor Prompt for Frontend Development

```
I need to implement a public-facing application form in Next.js that submits user data to the backend API endpoint `/applications/submit`. 

The form should:
1. Collect all required user fields (name, email, gender, primaryPhone, secondaryPhone, currentCity, permanentCity, yearsOfEducation, highestDegree, majors, university, yearOfCompletion, totalExperience, experienceUnit, experiences array, workingDays, weekends, onsiteSessions, remoteSessions, blueTeam, redTeam, grc, consent)
2. Validate all required fields before submission
3. Handle form submission state (loading, success, error)
4. Show appropriate success/error messages
5. Submit data to POST /applications/submit endpoint
6. Redirect to a thank-you page on successful submission

Requirements:
- Use TypeScript
- Use React hooks for form state management
- Implement proper form validation
- Add loading states during submission
- Handle API errors gracefully
- Use Tailwind CSS or similar for styling
- Make the form responsive
- Add proper accessibility attributes

The API endpoint returns:
- Success: { success: true, message: string, s3Key?: string }
- Error: { error: string } or { message: string }

Create a complete, production-ready form component.
```

## Implementation Steps

### 1. Create API Route Handler

```typescript
// app/api/submit-application/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const response = await fetch(`${API_URL}/applications/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to submit application' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
```

### 2. Create Form Component

See the full implementation guide in the documentation. The form should include:
- All required fields from CreateUserDto
- Proper validation
- Experience array management (add/remove)
- Loading and error states
- Success handling with redirect

### 3. Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Thank You Page

Create a thank-you page that users are redirected to after successful submission.

## Key Points

1. **Form Validation**: Validate all required fields before submission
2. **Error Handling**: Show user-friendly error messages
3. **Loading States**: Provide visual feedback during submission
4. **Success Flow**: Redirect to thank-you page after successful submission
5. **Accessibility**: Use proper labels and ARIA attributes
6. **Responsive Design**: Ensure form works on all screen sizes

