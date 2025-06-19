import { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Home, 
  Building2, 
  Briefcase,
  MoreVertical, 
  Edit, 
  Trash,
  X
} from 'lucide-react';

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export const Addresses = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      phone: '123-456-7890',
      isDefault: true
    }
  ]);

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'office':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    })));
  };

  const cleanupForm = () => {
    setIsAddModalOpen(false);
    setEditingAddress(null);
    setFormData({
      type: 'home',
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAddress = {
      ...formData,
      id: editingAddress ? editingAddress.id : Math.random().toString(36).substr(2, 9),
    } as Address;

    if (editingAddress) {
      // Editing existing address
      setAddresses(addresses.map(addr => {
        if (addr.id === editingAddress.id) {
          return {
            ...newAddress,
            isDefault: editingAddress.isDefault || newAddress.isDefault
          };
        }
        // If the new address is set as default, unset others
        return newAddress.isDefault ? { ...addr, isDefault: false } : addr;
      }));
    } else {
      // Adding new address
      if (newAddress.isDefault) {
        setAddresses(addresses.map(addr => ({ ...addr, isDefault: false })).concat(newAddress));
      } else {
        // If this is the first address, make it default
        if (addresses.length === 0) {
          newAddress.isDefault = true;
        }
        setAddresses([...addresses, newAddress]);
      }
    }

    cleanupForm();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Saved Addresses</h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No addresses saved</h3>
              <p className="mt-1 text-sm sm:text-base text-gray-500">
                Add a new address to save it for future purchases
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="relative bg-white sm:bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow"
                >
                  {address.isDefault && (
                    <div className="absolute right-0 top-0 p-3">
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                        Default
                      </span>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 text-gray-500 flex-shrink-0">
                      {getAddressIcon(address.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate pr-16">{address.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 break-words">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                      <p className="mt-2 text-sm text-gray-600">Phone: {address.phone}</p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setFormData(address);
                            setIsAddModalOpen(true);
                          }}
                          className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        {!address.isDefault && (
                          <>
                            <button
                              onClick={() => handleDelete(address.id)}
                              className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-700 rounded-md hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="inline-flex items-center px-2 py-1 text-sm text-rose-600 hover:text-rose-700 rounded-md hover:bg-rose-50"
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Set as Default
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {(isAddModalOpen || editingAddress) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" 
              aria-hidden="true"
              onClick={cleanupForm}
            />
            
            {/* Center modal on desktop */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="relative inline-block w-full transform overflow-hidden rounded-t-xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:rounded-xl sm:align-middle">
              <div className="bg-white">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={cleanupForm}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address Type
                      </label>
                      <select
                        value={formData.type || 'home'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Address['type'] })}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                        required
                      >
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                        placeholder="Enter street address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                          placeholder="Enter city"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                          placeholder="Enter state"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={formData.pincode || ''}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-rose-500 focus:border-rose-500 text-base"
                        placeholder="Enter PIN code"
                        required
                      />
                    </div>

                    {!editingAddress?.isDefault && (
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={formData.isDefault || false}
                          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                          className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-base text-gray-900">
                          Set as default address
                        </label>
                      </div>
                    )}

                    <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4">
                      <div className="flex flex-col-reverse sm:flex-row sm:space-x-3">
                        <button
                          type="button"
                          onClick={cleanupForm}
                          className="mt-3 sm:mt-0 w-full sm:w-1/2 inline-flex justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:w-1/2 inline-flex justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                        >
                          {editingAddress ? 'Save Changes' : 'Add Address'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
