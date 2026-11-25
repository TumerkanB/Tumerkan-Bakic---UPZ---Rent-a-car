import { ChevronDown, ChevronRight, FolderTree, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FileUploader } from '../../components/ui/FileUploader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  bulkImportModels,
  createBrand,
  createCategory,
  createManufacturer,
  createModel,
  deleteBrand,
  deleteCategory,
  deleteManufacturer,
  deleteModel,
  fetchAllCategoriesAdmin,
  fetchCatalogData,
  updateBrand,
  updateCategory,
  updateManufacturer,
  updateModel,
  type BrandItem,
  type CatalogDataResponse,
  type CategoryItem,
  type ManufacturerItem,
  type ModelItem,
} from './fleetApi';

type CatalogTab = 'tree' | 'manufacturers' | 'brands' | 'models' | 'categories' | 'import';

export function CatalogManagementPage() {
  const { showSuccess, showError } = useToast();
  const [tab, setTab] = useState<CatalogTab>('tree');
  const [catalog, setCatalog] = useState<CatalogDataResponse | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMans, setExpandedMans] = useState<Record<number, boolean>>({});

  // Manufacturer form
  const [manName, setManName] = useState('');
  const [manLogo, setManLogo] = useState('');
  const [editingMan, setEditingMan] = useState<ManufacturerItem | null>(null);

  // Brand form
  const [brandName, setBrandName] = useState('');
  const [brandManId, setBrandManId] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Model form (+ quick-add brand)
  const [modelName, setModelName] = useState('');
  const [modelBrandId, setModelBrandId] = useState('');
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [quickAddBrand, setQuickAddBrand] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState('');
  const [quickBrandManId, setQuickBrandManId] = useState('');

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catDeposit, setCatDeposit] = useState('0');
  const [catActive, setCatActive] = useState(true);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);

  // CSV bulk import
  const [csvText, setCsvText] = useState('Corolla,Toyota\nYaris,Toyota\nGolf,Volkswagen');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    insertedCount: number;
    skippedCount: number;
    errors: string[];
  } | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: 'manufacturers' | 'brands' | 'models' | 'categories';
    id: number;
    label: string;
  } | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([fetchCatalogData(), fetchAllCategoriesAdmin()])
      .then(([catData, catList]) => {
        setCatalog(catData);
        setCategories(catList.items);
      })
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load catalog'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleManufacturerSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingMan) {
        await updateManufacturer(editingMan.manufacturerID, manName, manLogo || null);
        setEditingMan(null);
        showSuccess('Manufacturer updated');
      } else {
        await createManufacturer(manName, manLogo || null);
        showSuccess('Manufacturer created');
      }
      setManName('');
      setManLogo('');
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleBrandSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.brandID, brandName, Number(brandManId), brandLogo || null);
        setEditingBrand(null);
        showSuccess('Brand updated');
      } else {
        await createBrand(brandName, Number(brandManId), brandLogo || null);
        showSuccess('Brand created');
      }
      setBrandName('');
      setBrandManId('');
      setBrandLogo('');
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleModelSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingModel) {
        await updateModel(editingModel.modelID, modelName, Number(modelBrandId));
        setEditingModel(null);
        showSuccess('Model updated');
      } else {
        await createModel(modelName, Number(modelBrandId));
        showSuccess('Model created');
      }
      setModelName('');
      setModelBrandId('');
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleQuickCreateBrand() {
    if (!quickBrandName.trim() || !quickBrandManId) return;
    try {
      const res = (await createBrand(quickBrandName.trim(), Number(quickBrandManId), null)) as {
        brand: { brandID: number };
      };
      setQuickBrandName('');
      setQuickBrandManId('');
      setQuickAddBrand(false);
      await loadAll();
      setModelBrandId(String(res.brand.brandID));
      showSuccess('Brand added');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Unable to add brand');
    }
  }

  async function handleCategorySubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        categoryName: catName.trim(),
        description: catDesc.trim() || null,
        depositAmount: Number(catDeposit),
        isActive: catActive,
      };
      if (editingCat) {
        await updateCategory(editingCat.categoryID, payload);
        setEditingCat(null);
        showSuccess('Category updated');
      } else {
        await createCategory(payload);
        showSuccess('Category created');
      }
      setCatName('');
      setCatDesc('');
      setCatDeposit('0');
      setCatActive(true);
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Operation failed');
    }
  }

  async function handleBulkImport(e: FormEvent) {
    e.preventDefault();
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const items = lines
      .map((line) => {
        const [model, brand] = line.split(',').map((s) => s.trim());
        return { modelName: model ?? '', brandName: brand ?? '' };
      })
      .filter(
        (x) =>
          x.modelName &&
          x.brandName &&
          !(x.modelName.toLowerCase() === 'name' && x.brandName.toLowerCase() === 'brand'),
      );

    if (items.length === 0) {
      showError('Provide at least one "modelName,brandName" row');
      return;
    }

    setImporting(true);
    try {
      const res = await bulkImportModels(items);
      setImportResult(res);
      showSuccess(`Imported ${res.insertedCount} models (${res.skippedCount} skipped)`);
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === 'manufacturers') await deleteManufacturer(deleteTarget.id);
      if (deleteTarget.kind === 'brands') await deleteBrand(deleteTarget.id);
      if (deleteTarget.kind === 'models') await deleteModel(deleteTarget.id);
      if (deleteTarget.kind === 'categories') await deleteCategory(deleteTarget.id);
      showSuccess('Deleted successfully');
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Cannot delete item');
      setDeleteTarget(null);
    }
  }

  const tabs: { id: CatalogTab; label: string }[] = [
    { id: 'tree', label: 'Tree View' },
    { id: 'manufacturers', label: 'Manufacturers' },
    { id: 'brands', label: 'Brands' },
    { id: 'models', label: 'Models' },
    { id: 'categories', label: 'Categories' },
    { id: 'import', label: 'Bulk CSV Import' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Fleet Catalog</h1>
        <p className="text-sm text-slate-500">
          Manage manufacturers, brands, models, car categories, and bulk model imports.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && !catalog ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading catalog...</div>
      ) : (
        <>
          {tab === 'tree' && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FolderTree className="h-4 w-4" />
                Manufacturer &gt; Brand &gt; Model
              </div>
              {catalog?.manufacturers.map((m) => {
                const isOpen = Boolean(expandedMans[m.manufacturerID]);
                const manBrands = catalog.brands.filter((b) => b.manufacturerID === m.manufacturerID);
                return (
                  <div key={m.manufacturerID} className="rounded-lg border border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMans((prev) => ({
                          ...prev,
                          [m.manufacturerID]: !prev[m.manufacturerID],
                        }))
                      }
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                        {m.logoUrl && (
                          <img src={m.logoUrl} alt={m.name} className="h-5 w-6 object-contain" />
                        )}
                        <span className="text-sm font-medium text-slate-900">{m.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{m.brandCount ?? manBrands.length} brands</span>
                    </button>

                    {isOpen && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                        {manBrands.length === 0 ? (
                          <div className="text-xs text-slate-400">No brands</div>
                        ) : (
                          manBrands.map((b) => {
                            const brandModels = catalog.models.filter((mo) => mo.brandID === b.brandID);
                            return (
                              <div key={b.brandID} className="rounded-lg bg-white p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {b.logoUrl && (
                                      <img src={b.logoUrl} alt={b.brandName} className="h-4 w-5 object-contain" />
                                    )}
                                    <span className="text-sm font-medium text-slate-800">{b.brandName}</span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {b.modelCount ?? brandModels.length} models
                                  </span>
                                </div>
                                {brandModels.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {brandModels.map((mo) => (
                                      <span
                                        key={mo.modelID}
                                        className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                                      >
                                        {mo.modelName} ({mo.carCount ?? 0})
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'manufacturers' && (
            <div className="space-y-6">
              <form
                onSubmit={handleManufacturerSubmit}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <input
                  type="text"
                  required
                  value={manName}
                  onChange={(e) => setManName(e.target.value)}
                  placeholder="Manufacturer name *"
                  className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={manLogo}
                  onChange={(e) => setManLogo(e.target.value)}
                  placeholder="Logo URL (or upload)"
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <FileUploader kind="logo" onUploaded={setManLogo} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Brands</th>
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
                        <td className="px-4 py-2.5 text-slate-600">{m.brandCount ?? 0}</td>
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
                              onClick={() =>
                                setDeleteTarget({ kind: 'manufacturers', id: m.manufacturerID, label: m.name })
                              }
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
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand name *"
                  className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <select
                  required
                  value={brandManId}
                  onChange={(e) => setBrandManId(e.target.value)}
                  className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select manufacturer *</option>
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
                  placeholder="Logo URL (or upload)"
                  className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <FileUploader kind="logo" onUploaded={setBrandLogo} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Manufacturer</th>
                      <th className="px-4 py-3">Models</th>
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
                        <td className="px-4 py-2.5 text-slate-600">{b.modelCount ?? 0}</td>
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
                              onClick={() =>
                                setDeleteTarget({ kind: 'brands', id: b.brandID, label: b.brandName })
                              }
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
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <form onSubmit={handleModelSubmit} className="flex flex-wrap items-center gap-3">
                  <select
                    required
                    value={modelBrandId}
                    onChange={(e) => setModelBrandId(e.target.value)}
                    className="min-w-[180px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select brand *</option>
                    {catalog?.brands.map((b) => (
                      <option key={b.brandID} value={b.brandID}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setQuickAddBrand((v) => !v)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    + Quick-add brand
                  </button>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Model name *"
                    className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                    >
                      Cancel
                    </button>
                  )}
                </form>

                {quickAddBrand && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <input
                      type="text"
                      value={quickBrandName}
                      onChange={(e) => setQuickBrandName(e.target.value)}
                      placeholder="New brand name"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                    <select
                      value={quickBrandManId}
                      onChange={(e) => setQuickBrandManId(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    >
                      <option value="">Manufacturer</option>
                      {catalog?.manufacturers.map((m) => (
                        <option key={m.manufacturerID} value={m.manufacturerID}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleQuickCreateBrand}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Save brand
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Cars</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catalog?.models.map((mo) => (
                      <tr key={mo.modelID}>
                        <td className="px-4 py-2.5 text-slate-600">{mo.brandName}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{mo.modelName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{mo.carCount ?? 0}</td>
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
                              onClick={() =>
                                setDeleteTarget({ kind: 'models', id: mo.modelID, label: mo.modelName })
                              }
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

          {tab === 'categories' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCategorySubmit}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5"
              >
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Category name *"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Description"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={catDeposit}
                  onChange={(e) => setCatDeposit(e.target.value)}
                  placeholder="Deposit (€)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={catActive}
                      onChange={(e) => setCatActive(e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {editingCat ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Deposit</th>
                      <th className="px-4 py-3">Current Base Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((c) => (
                      <tr key={c.categoryID}>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{c.categoryName}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{c.description ?? '—'}</td>
                        <td className="px-4 py-2.5 text-slate-700">€{Number(c.depositAmount).toFixed(2)}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">
                          {c.currentBaseRate != null ? `€${Number(c.currentBaseRate).toFixed(2)}/day` : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={c.isActive === 1 ? 'Active' : 'Inactive'} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCat(c);
                                setCatName(c.categoryName);
                                setCatDesc(c.description ?? '');
                                setCatDeposit(String(c.depositAmount));
                                setCatActive(c.isActive === 1);
                              }}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({ kind: 'categories', id: c.categoryID, label: c.categoryName })
                              }
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

          {tab === 'import' && (
            <form onSubmit={handleBulkImport} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Bulk Import Models (CSV)</h2>
                <p className="text-xs text-slate-500">
                  One model per line in <code>modelName,brandName</code> format. Existing models are skipped.
                </p>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={importing}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import models'}
              </button>

              {importResult && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                  <div>
                    Inserted: <strong>{importResult.insertedCount}</strong> · Skipped:{' '}
                    <strong>{importResult.skippedCount}</strong>
                  </div>
                  {importResult.errors.length > 0 && (
                    <ul className="mt-2 list-disc pl-4 text-red-600">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm delete"
        message={`Delete "${deleteTarget?.label}"? This is blocked if records reference it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
