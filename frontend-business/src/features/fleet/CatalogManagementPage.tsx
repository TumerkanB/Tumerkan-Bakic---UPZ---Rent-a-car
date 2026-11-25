import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../lib/apiClient';
import {
  createBrand,
  createManufacturer,
  createModel,
  deleteBrand,
  deleteManufacturer,
  deleteModel,
  fetchCatalogData,
  updateBrand,
  updateManufacturer,
  updateModel,
  type BrandItem,
  type CatalogDataResponse,
  type ManufacturerItem,
  type ModelItem,
} from './fleetApi';

type CatalogTab = 'manufacturers' | 'brands' | 'models';

export function CatalogManagementPage() {
  const [tab, setTab] = useState<CatalogTab>('manufacturers');
  const [catalog, setCatalog] = useState<CatalogDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manufacturer form
  const [manName, setManName] = useState('');
  const [manLogo, setManLogo] = useState('');
  const [editingMan, setEditingMan] = useState<ManufacturerItem | null>(null);

  // Brand form
  const [brandName, setBrandName] = useState('');
  const [brandManId, setBrandManId] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Model form
  const [modelName, setModelName] = useState('');
  const [modelBrandId, setModelBrandId] = useState('');
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);

  function loadCatalog() {
    setLoading(true);
    setError(null);
    fetchCatalogData()
      .then(setCatalog)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load catalog'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  async function handleManufacturerSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingMan) {
        await updateManufacturer(editingMan.manufacturerID, manName, manLogo || null);
        setEditingMan(null);
      } else {
        await createManufacturer(manName, manLogo || null);
      }
      setManName('');
      setManLogo('');
      loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleBrandSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.brandID, brandName, Number(brandManId), brandLogo || null);
        setEditingBrand(null);
      } else {
        await createBrand(brandName, Number(brandManId), brandLogo || null);
      }
      setBrandName('');
      setBrandManId('');
      setBrandLogo('');
      loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleModelSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingModel) {
        await updateModel(editingModel.modelID, modelName, Number(modelBrandId));
        setEditingModel(null);
      } else {
        await createModel(modelName, Number(modelBrandId));
      }
      setModelName('');
      setModelBrandId('');
      loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(kind: CatalogTab, id: number) {
    setError(null);
    try {
      if (kind === 'manufacturers') await deleteManufacturer(id);
      if (kind === 'brands') await deleteBrand(id);
      if (kind === 'models') await deleteModel(id);
      loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cannot delete item (it may be in use)');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Manufacturers, Brands &amp; Models</h1>
        <p className="text-sm text-slate-500">Manage vehicle manufacturers, brand logos, and model catalog.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(['manufacturers', 'brands', 'models'] as CatalogTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && !catalog ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading catalog...</div>
      ) : (
        <>
          {tab === 'manufacturers' && (
            <div className="space-y-6">
              <form
                onSubmit={handleManufacturerSubmit}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
              >
                <input
                  type="text"
                  required
                  value={manName}
                  onChange={(e) => setManName(e.target.value)}
                  placeholder="Manufacturer name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={manLogo}
                  onChange={(e) => setManLogo(e.target.value)}
                  placeholder="Logo URL (optional)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:col-span-2"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    {editingMan ? 'Update' : 'Add'}
                  </button>
                  {editingMan && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMan(null);
                        setManName('');
                        setManLogo('');
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catalog?.manufacturers.map((m) => (
                      <tr key={m.manufacturerID}>
                        <td className="px-4 py-2.5">
                          {m.logoUrl ? (
                            <img src={m.logoUrl} alt={m.name} className="h-6 w-8 object-contain" />
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{m.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMan(m);
                                setManName(m.name);
                                setManLogo(m.logoUrl ?? '');
                              }}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete('manufacturers', m.manufacturerID)}
                              className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'brands' && (
            <div className="space-y-6">
              <form
                onSubmit={handleBrandSubmit}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
              >
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <select
                  required
                  value={brandManId}
                  onChange={(e) => setBrandManId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select manufacturer</option>
                  {catalog?.manufacturers.map((m) => (
                    <option key={m.manufacturerID} value={m.manufacturerID}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="Logo URL (optional)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    {editingBrand ? 'Update' : 'Add'}
                  </button>
                  {editingBrand && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(null);
                        setBrandName('');
                        setBrandManId('');
                        setBrandLogo('');
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Manufacturer</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catalog?.brands.map((b) => (
                      <tr key={b.brandID}>
                        <td className="px-4 py-2.5">
                          {b.logoUrl ? (
                            <img src={b.logoUrl} alt={b.brandName} className="h-6 w-8 object-contain" />
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{b.brandName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{b.manufacturerName}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBrand(b);
                                setBrandName(b.brandName);
                                setBrandManId(String(b.manufacturerID));
                                setBrandLogo(b.logoUrl ?? '');
                              }}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete('brands', b.brandID)}
                              className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'models' && (
            <div className="space-y-6">
              <form
                onSubmit={handleModelSubmit}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3"
              >
                <select
                  required
                  value={modelBrandId}
                  onChange={(e) => setModelBrandId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select brand</option>
                  {catalog?.brands.map((b) => (
                    <option key={b.brandID} value={b.brandID}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Model name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    {editingModel ? 'Update' : 'Add'}
                  </button>
                  {editingModel && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModel(null);
                        setModelName('');
                        setModelBrandId('');
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catalog?.models.map((mo) => (
                      <tr key={mo.modelID}>
                        <td className="px-4 py-2.5 text-slate-600">{mo.brandName}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{mo.modelName}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingModel(mo);
                                setModelName(mo.modelName);
                                setModelBrandId(String(mo.brandID));
                              }}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete('models', mo.modelID)}
                              className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
