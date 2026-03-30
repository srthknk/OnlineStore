'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faStore,
  faImage,
  faArrowLeft,
  faCheckCircle,
  faTruck,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/app/deliverypartner/register.module.css';

export default function DeliveryPartnerPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    photoUrl: '',
    selectedStoreId: '',
  });

  const [stores, setStores] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Fetch list of stores
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores/list');
        if (response.ok) {
          const data = await response.json();
          setStores(data.stores || []);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    if (isLoaded) {
      fetchStores();

      // Pre-fill email if user is logged in
      if (user?.primaryEmailAddress?.emailAddress) {
        setFormData((prev) => ({
          ...prev,
          email: user.primaryEmailAddress.emailAddress,
        }));
      }
    }
  }, [isLoaded, user]);

  const validateForm = () => {
    const newErrors = {};

    // First name validation - capital letter mandatory
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Z]/.test(formData.firstName)) {
      newErrors.firstName = 'First name must start with a capital letter';
    }

    // Last name validation - capital letter mandatory
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Z]/.test(formData.lastName)) {
      newErrors.lastName = 'Last name must start with a capital letter';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Gmail is required';
    } else if (!formData.email.includes('@gmail.com')) {
      newErrors.email = 'Only Gmail addresses are accepted';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Store selection
    if (!formData.selectedStoreId) {
      newErrors.selectedStoreId = 'Please select a store';
    }

    // Photo validation
    if (!photoFile) {
      newErrors.photoUrl = 'Photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For firstName and lastName, ensure first letter is capital
    if (name === 'firstName' || name === 'lastName') {
      if (value.length > 0) {
        const processed = value.charAt(0).toUpperCase() + value.slice(1);
        setFormData((prev) => ({ ...prev, [name]: processed }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload photo to ImageKit or similar service
      // For now, we'll use a simple approach
      let photoUrl = '';

      if (photoFile) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('file', photoFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataPhoto,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.url;
        }
      }

      // Register delivery partner
      const response = await fetch('/api/delivery-partners/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          photoUrl,
          selectedStoreId: formData.selectedStoreId,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        const error = await response.json();
        alert(error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <FontAwesomeIcon icon={faTruck} className={styles.icon} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loginRequiredBox}>
          <FontAwesomeIcon icon={faLock} className={styles.lockIcon} />
          <h2>Login Required</h2>
          <p>You need to be logged in to register as a delivery partner.</p>
          <p className={styles.subtext}>Login first to secure your email address and proceed with registration.</p>
          <SignInButton mode="modal">
            <button className={styles.loginBtn}>
              <FontAwesomeIcon icon={faUser} /> Login Now
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successBox}>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
          <h2>Thank You for Your Registration!</h2>
          <p>
            We have received your details and are reviewing your application. You will be notified
            once the admin approves your registration.
          </p>
          <p className={styles.subtext}>Redirecting to home in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <div className={styles.titleSection}>
          <FontAwesomeIcon icon={faTruck} className={styles.headerIcon} />
          <div>
            <h1>Join Our Delivery Network</h1>
            <p>Register as a delivery partner and start earning</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h3>
            <FontAwesomeIcon icon={faUser} /> Personal Information
          </h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">
                <FontAwesomeIcon icon={faUser} /> First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name (capital letter)"
                className={errors.firstName ? styles.inputError : ''}
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">
                <FontAwesomeIcon icon={faUser} /> Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name (capital letter)"
                className={errors.lastName ? styles.inputError : ''}
              />
              {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">
                <FontAwesomeIcon icon={faPhone} /> Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit phone number"
                className={errors.phone ? styles.inputError : ''}
              />
              {errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> Gmail * <span className={styles.lockedBadge}><FontAwesomeIcon icon={faLock} /> Locked</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="Your logged-in email address"
                className={styles.lockedInput}
                title="This email is locked to your account. Login with a different email if you need to change it."
              />
              <small className={styles.emailHelp}>This is your registered email. You cannot change it during registration.</small>
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> Location & Store
          </h3>

          <div className={styles.formGroup}>
            <label htmlFor="address">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete address"
              rows={4}
              className={errors.address ? styles.inputError : ''}
            />
            {errors.address && <span className={styles.error}>{errors.address}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="selectedStoreId">
              <FontAwesomeIcon icon={faStore} /> Select Store to Work With *
            </label>
            <select
              id="selectedStoreId"
              name="selectedStoreId"
              value={formData.selectedStoreId}
              onChange={handleInputChange}
              className={errors.selectedStoreId ? styles.inputError : ''}
            >
              <option value="">-- Choose a Store --</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.selectedStoreId && (
              <span className={styles.error}>{errors.selectedStoreId}</span>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>
            <FontAwesomeIcon icon={faImage} /> Photo
          </h3>

          <div className={styles.photoUpload}>
            <div className={styles.uploadBox}>
              {imagePreview ? (
                <div className={styles.previewImage}>
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setImagePreview('');
                    }}
                    className={styles.changeButton}
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <label htmlFor="photoUrl" className={styles.uploadLabel}>
                  <FontAwesomeIcon icon={faImage} className={styles.uploadIcon} />
                  <span>Click to upload or drag and drop</span>
                  <input
                    type="file"
                    id="photoUrl"
                    name="photoUrl"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className={styles.hiddenInput}
                  />
                </label>
              )}
            </div>
            {errors.photoUrl && <span className={styles.error}>{errors.photoUrl}</span>}
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <>
              <FontAwesomeIcon icon={faTruck} className={styles.loadingIcon} />
              Registering...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} />
              Register as Delivery Partner
            </>
          )}
        </button>
      </form>
    </div>
  );
}
